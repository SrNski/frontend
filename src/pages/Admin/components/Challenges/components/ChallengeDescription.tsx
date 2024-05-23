import {
    defaultValueCtx,
    Editor,
    editorViewOptionsCtx,
    rootCtx,
    commandsCtx,
    CmdKey,
} from '@milkdown/core';
import { type FC } from 'react';
import { Milkdown, useEditor } from '@milkdown/react';
import {
    commonmark,
    toggleEmphasisCommand,
    wrapInHeadingCommand,
    toggleStrongCommand,
    wrapInBulletListCommand,
} from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';
import DescriptionData from '../../../../../interfaces/DescriptionData';
import '@milkdown/theme-nord/style.css';
import '../Challenges.css';
import italicIcon from '../../../../../assets/italic-icon.png';
import headerIcon from '../../../../../assets/header-icon.png';
import boldIcon from '../../../../../assets/bold-icon.png';
import listIcon from '../../../../../assets/list-icon.png';

/**
 * Challenge Description editor component used in the admin challenge management page.
 * @author Timo Hauser
 *
 * @param {DescriptionData} descriptionData
 * @returns {React.ReactNode}
 */
export const ChallengeDescription: FC<DescriptionData> = (descriptionData) => {
    function executeCommand<T>(key: CmdKey<T>) {
        editor.get()?.action((ctx) => {
            // get command manager
            const commandManager = ctx.get(commandsCtx);

            // call command
            commandManager.call(key);
        });
    }

    /**
     * Toggle italic text in the editor
     * @author Timo Hauser
     *
     * @returns {void}
     */
    const toggleItalic = () => executeCommand(toggleEmphasisCommand.key);

    /**
     * Toggle heading in the editor
     * @author Timo Hauser
     *
     * @returns {void}
     */
    const toggleHeading = () => executeCommand(wrapInHeadingCommand.key);

    /**
     * toggle strong text in the editor
     * @author Timo Hauser
     *
     * @returns {void}
     */
    const toggleStrong = () => executeCommand(toggleStrongCommand.key);

    /**
     * toggle list in the editor
     * @author Timo Hauser
     *
     * @returns {void}
     */
    const toggleList = () => executeCommand(wrapInBulletListCommand.key);

    /**
     * Editor instance
     * @author Timo Hauser
     *
     * @type {UseEditorReturn}
     */
    const editor = useEditor((root) => {
        return Editor.make()
            .config((ctx) => {
                const listener = ctx.get(listenerCtx);
                listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
                    if (markdown !== prevMarkdown) {
                        descriptionData.onChange(markdown);
                    }
                });
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, descriptionData.description);
                ctx.update(editorViewOptionsCtx, (prev) => ({
                    ...prev,
                    editable: () => descriptionData.isEditingEnabled,
                }));
            })
            .config(nord)
            .use(commonmark)
            .use(listener);
    }, []);

    return (
        <div className="description">
            {descriptionData.isEditingEnabled && (
                <div className="description-menu-bar">
                    <button
                        className="description-menu-button"
                        onClick={toggleItalic}
                    >
                        <img
                            width={15}
                            height={15}
                            className="description-menu-image"
                            src={italicIcon}
                        ></img>
                    </button>
                    <button
                        className="description-menu-button"
                        onClick={toggleStrong}
                    >
                        <img
                            width={15}
                            height={15}
                            className="description-menu-image"
                            src={boldIcon}
                        ></img>
                    </button>
                    <button
                        className="description-menu-button"
                        onClick={toggleHeading}
                    >
                        <img
                            width={15}
                            height={15}
                            className="description-menu-image"
                            src={headerIcon}
                        ></img>
                    </button>
                    <button
                        className="description-menu-button"
                        onClick={toggleList}
                    >
                        <img
                            width={15}
                            height={15}
                            className="description-menu-image"
                            src={listIcon}
                        ></img>
                    </button>
                </div>
            )}
            <Milkdown />
        </div>
    );
};
