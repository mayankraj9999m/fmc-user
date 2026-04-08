import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Building,
    Star,
    Clock,
    GraduationCap,
    Wrench,
    Shield,
    Check,
    Loader2,
    X,
    Edit3,
    IdCardIcon,
} from "lucide-react";
import LoadingScreen from "../LoadingScreen";
import styles from "./Profile.module.css";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { onboardStudent, updateAdminPassword, updateStudentProfile } from "../../api";
import { NoticeBox } from "../../components/NoticeBox/NoticeBox";
import Modal from "../../components/Modal/Modal";
import { FormActions, FormRow, Input, Select } from "../../components/FormElements/FormElements";
import { Button } from "../../components/Buttons/Button";
import { DetailItem } from "../../components/DetailIem";

const Profile = () => {
    const { user, role, error, loading, refreshProfile } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    //! Edit Profile State {FOR STUDENTS}
    // 4 states
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const hasPromptedForOnboarding = useRef(false);

    const [editData, setEditData] = useState({
        phone_no: "",
        gender: "",
        branch: "",
        year_of_joining: "",
        programme: "",
    });

    // Auto-prompt to complete profile if isOnboarded is false
    useEffect(() => {
        if (user && role === "student" && user.is_onboarded === false && !hasPromptedForOnboarding.current) {
            setIsEditing(true);
            hasPromptedForOnboarding.current = true;
        }
    }, [user, role]);

    // --- NEW: Handle clicking "Later" ---
    const handleLater = async () => {
        if (user && user.is_onboarded === false) {
            setIsSaving(true);
            try {
                await onboardStudent(); // Sets is_onboarded to true in DB
                await refreshProfile(); // Refresh local user state
            } catch (err) {
                console.error("Failed to skip onboarding", err);
            } finally {
                setIsSaving(false);
                setIsEditing(false);
            }
        } else {
            // If they are just normally editing and click cancel
            setIsEditing(false);
        }
    };

    // Populate edit form when edit mode opens
    useEffect(() => {
        if (user && isEditing) {
            setEditData({
                phone_no: user.phone_no || "",
                gender: user.gender || "",
                branch: user.branch || "",
                year_of_joining: user.year_of_joining || "",
                programme: user.programme || "",
            });
        }
    }, [user, isEditing]);

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateStudentProfile(editData);
            await refreshProfile();
            setIsEditing(false);
            showAlert("Profile updated successfully", "success");
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // --- NEW: Admin Password State ---
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    // Auto-prompt to change password if required (For Admins)
    useEffect(() => {
        if (user && role === "admin" && user.requires_password_change) {
            setIsChangingPassword(true);
        }
    }, [user, role]);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showAlert("New passwords do not match", "error");
        }
        setIsSaving(true);
        try {
            await updateAdminPassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            showAlert("Password updated successfully!", "success");
            setIsChangingPassword(false);
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            showAlert(err.response?.data?.error || "Failed to update password", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LoadingScreen message="Loading profile..." />;

    if (error || !user) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>{error || "User data not found."}</div>
            </div>
        );
    }

    const phoneNumber = user.phone_no;
    const avatarImg = user.profile_picture || user.photo;
    const isProfileIncomplete = role === "student" && user.is_onboarded === false;

    // Helper to format date & time nicely
    const formatDateTime = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Profile</h1>
                <p className={styles.subtitle}>Manage your account details and settings</p>
                {/* Add Change Password Button for Admins */}
                {role === "admin" && (
                    <Button onClick={() => setIsChangingPassword(true)} topMargin={true}>
                        Change Password
                    </Button>
                )}
                {role === "student" && (
                    <Button variant="primary" onClick={() => setIsEditing(true)} topMargin={true}>
                        <Edit3 size={18} /> {isProfileIncomplete ? "Complete Profile" : "Edit Profile"}
                    </Button>
                )}
            </div>

            {/* Notice for Incomplete Profile */}
            {isProfileIncomplete && (
                <NoticeBox>
                    <span>Your profile is incomplete. Please update your details.</span>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                        Complete Now
                    </Button>
                </NoticeBox>
            )}

            <div className={styles.profileCard}>
                <div className={styles.leftSide}>
                    <div className={styles.coverPhoto}>
                        <img src="/nit_front_gate.jpg"></img>
                    </div>

                    <div className={styles.avatarContainer}>
                        <div className={styles.avatarBorder}>
                            {avatarImg ? (
                                <img
                                    src={avatarImg}
                                    alt={user.name}
                                    className={styles.avatar}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    <h1>{user.name[0]}</h1>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.mainInfo}>
                        <h2 className={styles.name}>{user.name}</h2>
                        <span className={styles.roleBadge}>
                            {role === "student" && "🎓 Student"}
                            {role === "admin" && "🛡️ Administrator"}
                            {role === "worker" && "🔧 Service Staff"}
                        </span>
                    </div>
                </div>

                <div className={styles.detailsGrid}>
                    {/* Common Fields for Everyone */}
                    <DetailItem icon={Mail} label="Email Address" value={user.email} />
                    <DetailItem icon={Phone} label="Phone Number" value={phoneNumber} />
                    {user.hostel_name && <DetailItem icon={Building} label="Hostel Assigned" value={user.hostel_name} />}
                    {user.gender && <DetailItem icon={User} label="Gender" value={user.gender} />}

                    {/* ------------------------------------- */}
                    {/* STUDENT SPECIFIC FIELDS               */}
                    {/* ------------------------------------- */}
                    {role === "student" && (
                        <>
                            {user.roll_no && <DetailItem icon={IdCardIcon} label="Roll No" value={user.roll_no} />}
                            {user.room_no && (
                                <DetailItem
                                    icon={MapPin}
                                    label="Room Location"
                                    value={`Room ${user.room_no} (Floor ${user.floor_no})`}
                                />
                            )}
                            {user.programme && (
                                <DetailItem
                                    icon={GraduationCap}
                                    label="Programme"
                                    value={`${user.programme} ${user.branch ? `- ${user.branch}` : ""} ${user.year_of_joining ? `(${user.year_of_joining})` : ""}`}
                                />
                            )}
                        </>
                    )}

                    {/* ------------------------------------- */}
                    {/* ADMIN SPECIFIC FIELDS                 */}
                    {/* ------------------------------------- */}
                    {role === "admin" && user.position && (
                        <DetailItem icon={Shield} label="Designation" value={user.position} />
                    )}

                    {/* ------------------------------------- */}
                    {/* WORKER SPECIFIC FIELDS                */}
                    {/* ------------------------------------- */}
                    {role === "worker" && (
                        <>
                            <DetailItem
                                icon={Briefcase}
                                label="Department"
                                value={`${user.department} ${user.sub_work_category ? `- ${user.sub_work_category}` : ""}`}
                            />
                            <DetailItem
                                icon={Star}
                                label="Service Rating"
                                value={`${user.current_rating} ⭐ (${user.rating_count} reviews)`}
                            />
                        </>
                    )}

                    <DetailItem icon={Clock} label="Last Login" value={formatDateTime(user.last_login)} />
                    <DetailItem icon={Clock} label="Account Created on" value={formatDateTime(user.created_at)} />

                    {/* --- EDIT PROFILE MODAL --- */}
                    <Modal
                        isOpen={isEditing}
                        onClose={() => !isSaving && setIsEditing(false)}
                        title={isProfileIncomplete ? "Complete Your Profile" : "Edit Profile"}
                        disableClose={isSaving}
                    >
                        <form onSubmit={handleUpdateSubmit}>
                            <NoticeBox>
                                Fields like Name, Email, Hostel, and Room No cannot be changed. Contact administration
                                for corrections.
                            </NoticeBox>

                            <FormRow>
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={editData.phone_no}
                                    onChange={(e) => setEditData({ ...editData, phone_no: e.target.value })}
                                    disabled={isSaving}
                                />
                                <Select
                                    label="Gender"
                                    value={editData.gender}
                                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                    disabled={isSaving}
                                    options={[
                                        { value: "Male", label: "Male" },
                                        { value: "Female", label: "Female" },
                                        { value: "Other", label: "Other" },
                                    ]}
                                />
                            </FormRow>

                            <FormRow>
                                <Select
                                    label="Programme"
                                    value={editData.programme}
                                    onChange={(e) => setEditData({ ...editData, programme: e.target.value })}
                                    disabled={isSaving}
                                    options={[
                                        { value: "B.Tech", label: "B.Tech" },
                                        { value: "M.Tech", label: "M.Tech" },
                                        { value: "Ph.D", label: "Ph.D" },
                                    ]}
                                />
                                <Input
                                    label="Branch"
                                    type="text"
                                    placeholder="e.g. CSE"
                                    value={editData.branch}
                                    onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                                    disabled={isSaving}
                                />
                            </FormRow>

                            <FormRow>
                                <Input
                                    label="Year of Joining"
                                    type="number"
                                    min="2000"
                                    max="2030"
                                    placeholder="e.g. 2023"
                                    value={editData.year_of_joining}
                                    onChange={(e) => setEditData({ ...editData, year_of_joining: e.target.value })}
                                    disabled={isSaving}
                                />
                            </FormRow>

                            <FormActions>
                                <Button type="button" variant="secondary" onClick={handleLater} disabled={isSaving}>
                                    Later
                                </Button>
                                <Button type="submit" variant="primary" isLoading={isSaving} icon={Check}>
                                    Save Changes
                                </Button>
                            </FormActions>
                        </form>
                    </Modal>

                    {/* --- ADMIN CHANGE PASSWORD MODAL --- */}
                    <Modal
                        isOpen={isChangingPassword}
                        // If requires_password_change is true, they CANNOT close this modal without updating.
                        onClose={() => !user?.requires_password_change && setIsChangingPassword(false)}
                        title={user?.requires_password_change ? "Mandatory Security Update" : "Change Password"}
                        disableClose={isSaving || user?.requires_password_change}
                    >
                        <form onSubmit={handlePasswordUpdate}>
                            {user?.requires_password_change && (
                                <NoticeBox urgent={true}>
                                    <p>
                                        <p><strong>ACTION REQUIRED</strong></p>
                                        You are using a temporary system-generated password. You must change it to a
                                        secure, personal password before continuing.
                                    </p>
                                </NoticeBox>
                            )}

                            <FormRow>
                                <Input
                                    type="password"
                                    label="Current Password *"
                                    required
                                    disabled={isSaving}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                />
                            </FormRow>
                            <FormRow>
                                <Input
                                    type="password"
                                    label="New Password *"
                                    required
                                    disabled={isSaving}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                                <Input
                                    type="password"
                                    label="Confirm New Password *"
                                    required
                                    disabled={isSaving}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </FormRow>

                            <FormActions>
                                {!user?.requires_password_change && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsChangingPassword(false)}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" variant="primary" isLoading={isSaving} icon={Check}>
                                    Update Security
                                </Button>
                            </FormActions>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default Profile;
